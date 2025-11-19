export interface Weather {
  city_name: string;
  description: string;
  temperature: number;
  icon: string;
  wind_speed: number;
  humidity: number;
  hourly_forecast: {
    time: string;
    temperature: number;
    icon: string;
  }[];
}
