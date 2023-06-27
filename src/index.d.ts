/* eslint-disable no-unused-vars */
import { Application, Router, Request, Response, NextFunction } from "express";

// The token and user properties are not a part of the Request object by default.
declare global {
  namespace Express {
    interface Request {
      token?: string;
      user?: object;
    }
  }
}

export declare interface KeycloakUser {
  idir_user_guid?: string;
  identity_provider?: string;
  idir_username?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  display_name?: string;
  family_name?: string;
  client_roles?: string[];
}

export declare interface KeycloakInitOptions {
  afterUserLogin?: (userInfo: KeycloakUser) => void;
}

export declare function keycloakInit(
  app: Application,
  options?: KeycloakInitOptions
): void;
export declare function middleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any>;

declare function login(req: Request, res: Response): Promise<any>;
declare function loginCallback(
  options?: KeycloakInitOptions | undefined
): Promise<void>;
declare function loginCallbackRequest(
  req: Request,
  res: Response
): Promise<any>;
declare function logout(req: Request, res: Response): void;
declare function logoutCallback(req: Request, res: Response): void;
declare function refreshToken(req: Request, res: Response): Promise<any>;
declare function oauthRouter(options?: KeycloakInitOptions | undefined): Router;
declare function encodeToBase64(string: string): string;
declare function decodeBase64ToJSON(base64String: string): object;
declare function parseJWT(token: string): object;
declare function getTokens(code: unknown): Promise<any>;
declare function getNewAccessToken(refresh_token: string): Promise<any>;
declare function getAuthorizationUrl(): string;
declare function getLogoutUrl(): string;
declare function isJWTValid(jwt: string): Promise<boolean>;
declare function getUserInfo(access_token: string): any;
