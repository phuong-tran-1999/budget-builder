import { CdkCellDef } from '@angular/cdk/table';
import { Directive, Input } from '@angular/core';
import { MatCellDef, MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[matCellDef]', // same selector as MatCellDef
    providers: [
        { provide: CdkCellDef, useExisting: TypeSafeMatCellDefDirective },
    ],
    standalone: true,
})
export class TypeSafeMatCellDefDirective<T> extends MatCellDef {
    @Input() matCellDefDataSource?:
        | T[]
        | Observable<T[]>
        | MatTableDataSource<T>;

    static ngTemplateContextGuard<T>(
        dir: TypeSafeMatCellDefDirective<T>,
        ctx: any
    ): ctx is { $implicit: T; index: number; last: boolean } {
        return true;
    }
}
