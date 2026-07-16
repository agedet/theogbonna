import type { IUserDetails } from "../services/user/types";


export interface IBaseDocument {
  id: number;
  createdAt: Date;
  deletedAt: null;
}

export type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type NavbarProps = {
  user: IUserDetails | undefined;
  session: string;
  // session?: string;
};

