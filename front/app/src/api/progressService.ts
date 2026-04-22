import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3033",
});

export const getProgress = (jobId: string) =>
  API.get(`/progress/${jobId}`);