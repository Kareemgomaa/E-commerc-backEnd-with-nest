import { CallHandler, ExecutionContext, NestInterceptor, Injectable } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class LoggerINtercepter implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        console.log("Before Route handler");
        return next.handle().pipe(
            map((data) => {
                if (!data) return data;
                const removePassword = (obj: any) => {
                    if (obj && typeof obj === 'object') {
                        const { password, ...other } = obj;
                        return other;
                    }
                    return obj;
                };
                if (Array.isArray(data)) {
                    return data.map((item) => removePassword(item));
                }
                return removePassword(data);
            }),
        );
    }
}