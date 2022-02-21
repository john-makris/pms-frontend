import { Injectable } from "@angular/core";
import { 
    ActivatedRouteSnapshot,
    CanActivate, 
    CanLoad, 
    Route, 
    Router, 
    RouterStateSnapshot,
    UrlSegment,
    UrlTree 
} from "@angular/router";
import { map, take } from "rxjs/operators";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { SnackbarService } from "../common/snackbars/snackbar.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate, CanLoad{

    constructor(
        private authService: AuthService,
        private snackbarService: SnackbarService,
        private router: Router) {}

    canLoad(
        route: Route, 
        segments: UrlSegment[]): 
        boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
        
        return this.authService.user.pipe(
            take(1),
            map(user => {

                const isAuth = !!user;
                if (isAuth) {
                    console.log("IS AUTH");

                    return true;
                }
                console.log("IS NOT AUTH");

                return this.router.createUrlTree(['/login']);
            })
        );
    }

    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot
    ):
        | boolean
        | UrlTree
        | Promise<boolean | UrlTree>
        | Observable<boolean | UrlTree> {

        return this.authService.user.pipe(
            take(1),
            map(user => {

                const isAuth = !!user;
                if (isAuth) {
                
                    let userRoles = user?.roles;
                
                    if (userRoles) {
                        userRoles.forEach(role => {
                            if (route.data.roles && route.data.roles.indexOf(role) === -1) {
                                this.snackbarService.error("Unauthorised to access these resources");
                                this.router.navigate(['/home']);
                                return false;
                            } else {
                                return true;
                            }
                        });
                    } else {
                        return false;
                    }

                    return true;
                }

                return this.router.createUrlTree(['/login']);
            })
        );
    }
}