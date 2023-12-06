export class IFrontendUserDto {
    user_id?: string;
    user_role?: string[] | string | null;
    from?: string;
    data: {
        user_name: string;
        user_photo_url?: string;
        user_email?: string;
        user_shortcuts?: string[];
    };
}

export class LoginUserDto {
    user_email: string;
    user_password: string;
}
export class UserTokenDto {
    access_token: string;
}
