import type { AxiosRequestConfig } from "axios";


export type Document = {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
};

export type IApiResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type CustomAxiosError = {
  errors: Record<string, string>;
  message: string;
};

export type IApiError = {
  status: boolean;
  message: string;
};

export type CustomAxiosRequestConfig = object & AxiosRequestConfig;

export interface IErrorResponse {
  message: string;
  name: string;
  stack: string;
  config: Config;
  code: string;
  status: boolean;
  response: IResponse;
}

export interface Config {
  transitional: Transitional;
  adapter: string[];
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Env;
  headers: Headers;
  baseURL: string;
  method: string;
  url: string;
  data: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Env {}

export interface Headers {
  Accept: string;
  'Content-Type': string;
  Authorization: string;
}

export interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

export interface IResponse {
  data: Data;
  status: boolean;
  statusText: string;
  headers: IResponseHeaders;
  config: Config;
  request: Request;
}

export interface Config {
  transitional: Transitional;
  adapter: string[];
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Request;
  headers: ConfigHeaders;
  baseURL: string;
  method: string;
  url: string;
  data: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Request {}

export interface ConfigHeaders {
  Accept: string;
  'Content-Type': string;
  Authorization: string;
}

export interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

export interface Data {
  message: string;
  errors: Errors;
}

export interface Errors {
  email: string[];
}

export interface IResponseHeaders {
  'cache-control': string;
  'content-type': string;
}



export interface UserSummary {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}


export const OrderStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];



export interface Ticket {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  description: string;
  status: OrderStatus;
  trackingId: string;
  createdAt: string;
  updatedAt: string;
  assignedAgentId?: string;
  assignedAgent?: UserSummary;
  client?: UserSummary;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
