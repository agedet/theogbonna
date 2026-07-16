import AuthService from '../auth';
import type { IAuthUser } from '../auth/types';

export type UserProfile = IAuthUser;

class UserService {
  public static getProfile(): Promise<UserProfile> {
    return AuthService.getSession();
  }
}

export default UserService;
