import os
import gzip
import shutil
import time
from logging.handlers import TimedRotatingFileHandler

class GzipTimedRotatingFileHandler(TimedRotatingFileHandler):

    def getFilesToDelete(self):
        """
        Determine the files to delete when rolling over.
        """
        dirName, baseName = os.path.split(self.baseFilename)
        fileNames = os.listdir(dirName)
        result = []
        prefix = baseName + "."
        plen = len(prefix)
        for fileName in fileNames:
            if fileName.startswith(prefix) and fileName.endswith(".gz"):
                suffix = fileName[plen:-3]
                if self.extMatch.match(suffix):
                    result.append(os.path.join(dirName, fileName))
        
        result.sort()
        
        if len(result) < self.backupCount:
            return []
        else:
            return result[:len(result) - self.backupCount]

    def doRollover(self):
        """
        Do a rollover, gzipping the old log file and cleaning up old logs.
        """
        if self.stream:
            self.stream.close()
            self.stream = None

        currentTime = int(time.time())
        dstNow = time.localtime(currentTime)[-1]
        t = self.rolloverAt - self.interval
        if self.utc:
            timeTuple = time.gmtime(t)
        else:
            timeTuple = time.localtime(t)
            dstThen = timeTuple[-1]
            if dstNow != dstThen:
                if dstNow:
                    addend = 3600
                else:
                    addend = -3600
                timeTuple = time.localtime(t + addend)
        
        dfn = self.rotation_filename(self.baseFilename + "." + time.strftime(self.suffix, timeTuple))

        if not os.path.exists(dfn) and os.path.exists(self.baseFilename):
             self.rotate(self.baseFilename, dfn)
             
        # Gzip the rotated file
        with open(dfn, 'rb') as f_in:
            with gzip.open(dfn + '.gz', 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        os.remove(dfn)

        # Clean up old gzipped logs
        if self.backupCount > 0:
            for s in self.getFilesToDelete():
                os.remove(s)
        
        if not self.delay:
            self.stream = self._open()
        
        self.rolloverAt = self.rolloverAt + self.interval
