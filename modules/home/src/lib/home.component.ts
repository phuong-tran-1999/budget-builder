import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkMenuModule } from '@angular/cdk/menu';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MONTHPICKER_FORMATS, TypeSafeMatCellDefDirective } from '@modules/shared/core';
import { CategoryGroup } from '@modules/shared/data-access';
import { isNil } from 'lodash-es';
import { NgxMaskDirective } from 'ngx-mask';
import { combineLatest, debounceTime, distinctUntilChanged, map, skip, startWith, Subject, takeUntil, tap } from 'rxjs';
import {
    _calculateOpeningAndClosingBalance,
    _flattenAndSubtractColumns,
    _flattenAndSumColumns,
    _generateEmptyValues,
    _initMonths,
} from './home.util';

@Component({
    selector: 'bb-home',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        CdkMenuModule,
        MatMenuModule,
        MatSnackBarModule,
        A11yModule,
        TypeSafeMatCellDefDirective,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: MONTHPICKER_FORMATS,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    trap = viewChild(CdkTrapFocus);

    /* Initial values */
    currentYear = new Date().getFullYear();

    startPeriod = new Date(this.currentYear, 0, 1);
    endPeriod = new Date(this.currentYear, 2, 31);

    months = _initMonths(this.startPeriod, this.endPeriod);
    monthValues = this.months.map((item) => item.value);

    initGroup: CategoryGroup = { name: '', items: [''] };
    initialIncomeGroups: CategoryGroup[] = [{ name: '', items: [''] }];
    initialExpenseGroups: CategoryGroup[] = [{ name: '', items: [''] }];

    /* Injectables */
    _fb = inject(FormBuilder);
    _cdr = inject(ChangeDetectorRef);
    _destroyRef = inject(DestroyRef);
    _snackbar = inject(MatSnackBar);

    /* Private properties */
    _dateUpdate$ = new Subject<void>();

    /* Public properties */
    form = this._initForm();
    displayedColumns: string[] = ['category', ...this.monthValues];

    /* Public methods */
    addCategory(array: FormArray, row?: HTMLTableRowElement) {
        array.push(this._initCategoryForm('', this.monthValues));

        if (!row) return;

        setTimeout(() => {
            row?.nextElementSibling?.querySelector('input')?.focus();
        }, 0);
    }

    addGroup(type: 'income' | 'expense') {
        this.form.controls[type].controls.groups.push(this._initCategoryGroupForm(this.monthValues, this.initGroup));

        // this.trap()?.focusTrap.focusFirstTabbableElement();
    }

    applyRow(data: { category: FormGroup; index: number }) {
        const amounts = data.category.get('amounts') as FormArray;
        const currentValue = amounts.at(data.index).value;

        if (isNil(currentValue)) return;

        amounts.setValue(this.monthValues.map(() => currentValue));
        this._snackbar.open('Value applied to all months', 'Close', { duration: 2000 });
    }

    deleteRow(data: { categories: FormArray; categoryIndex: number; groups: FormArray; groupIndex: number }) {
        data.categories?.removeAt(data.categoryIndex);

        if (data.categories.length === 0) {
            data.groups?.removeAt(data.groupIndex);
        }
        this._snackbar.open('Row removed', 'Close', { duration: 2000 });
    }

    setMonthAndYear(normalizedMonthAndYear: Date, datepicker: MatDatepicker<Date>, type: 'startDate' | 'endDate') {
        // TODO: Should use dialog instead
        if (confirm('Are you sure update date? This action will delete all data')) {
            this.form.controls[type].patchValue(normalizedMonthAndYear);
        }

        datepicker.close();
    }

    moveHorizontal(direction: 'left' | 'right', cell: HTMLTableCellElement) {
        if (direction === 'left') {
            cell.previousElementSibling?.querySelector('input')?.focus();
        } else {
            cell.nextElementSibling?.querySelector('input')?.focus();
        }
    }

    moveVertical(direction: 'up' | 'down', row: HTMLTableRowElement, index: number) {
        if (direction === 'up') {
            const nearestPrevInput = row.previousElementSibling?.querySelectorAll('input');
            if (nearestPrevInput) {
                const el = nearestPrevInput[index] ?? nearestPrevInput[0];
                el.focus();
                return;
            }

            // row.parentElement?.querySelectorAll('input')[index]?.focus();
        } else {
            const nearestNextInput = row.nextElementSibling?.querySelectorAll('input');

            if (nearestNextInput) {
                const el = nearestNextInput[index] ?? nearestNextInput[0];
                el.focus();
                return;
            }

            // row.parentElement?.querySelectorAll('input')[index]?.focus();
        }
    }

    _trackByIndex(index: number) {
        return index;
    }

    /* Form Related Methods */
    _initForm() {
        const incomeGroups = [];
        const expenseGroups = [];

        for (const group of this.initialExpenseGroups) {
            const groupForm = this._initCategoryGroupForm(this.monthValues, group);
            expenseGroups.push(groupForm);
        }

        for (const group of this.initialIncomeGroups) {
            const groupForm = this._initCategoryGroupForm(this.monthValues, group);
            incomeGroups.push(groupForm);
        }

        const form = this._fb.group({
            startDate: [this.startPeriod],
            endDate: [this.endPeriod],
            income: this._fb.group({
                groups: this._fb.array(incomeGroups),
                total: this._initMonthForm(this.monthValues),
            }),
            expense: this._fb.group({
                groups: this._fb.array(expenseGroups),
                total: this._initMonthForm(this.monthValues),
            }),
            total: this._initMonthForm(this.monthValues),
            openingBalance: this._initMonthForm(this.monthValues),
            closingBalance: this._initMonthForm(this.monthValues),
        });

        const { income, expense, total, startDate, endDate, openingBalance, closingBalance } = form.controls;
        const { groups: iGroups, total: iTotal } = income.controls;
        const { groups: eGroups, total: eTotal } = expense.controls;

        combineLatest([
            startDate.valueChanges.pipe(startWith(startDate.value), distinctUntilChanged()),
            endDate.valueChanges.pipe(startWith(endDate.value), distinctUntilChanged()),
        ])
            .pipe(skip(1), takeUntilDestroyed(this._destroyRef))
            .subscribe((value) => {
                if (isNil(value[0]) || isNil(value[1])) return;
                this.startPeriod = value[0];
                this.endPeriod = value[1];
                const monthList = _initMonths(value[0], value[1]);
                this.months = monthList;
                this.monthValues = monthList.map((item) => item.value);
                this._dateUpdate$.next();
                this.form = this._initForm();
                this._cdr.markForCheck();
            });

        iGroups.valueChanges
            .pipe(
                debounceTime(150),
                map((groups) => _flattenAndSumColumns(groups.map((group) => group.subtotals).filter((item) => !!item))),
                takeUntil(this._dateUpdate$),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((total) => {
                if (total.length === 0) {
                    iTotal.patchValue(_generateEmptyValues(this.monthValues.length));
                } else {
                    iTotal.patchValue(total);
                }
            });

        eGroups.valueChanges
            .pipe(
                debounceTime(150),
                map((groups) => _flattenAndSumColumns(groups.map((group) => group.subtotals).filter((item) => !!item))),
                takeUntil(this._dateUpdate$),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((total) => {
                if (total.length === 0) {
                    eTotal.patchValue(_generateEmptyValues(this.monthValues.length));
                } else {
                    eTotal.patchValue(total);
                }
            });

        combineLatest([
            iTotal.valueChanges.pipe(startWith(iTotal.value)),
            eTotal.valueChanges.pipe(startWith(eTotal.value)),
        ])
            .pipe(
                map(([iTotal, eTotal]) => _flattenAndSubtractColumns(iTotal, eTotal)),
                takeUntil(this._dateUpdate$),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((result) => {
                total.patchValue(result);
                this._cdr.markForCheck();
            });

        total.valueChanges
            .pipe(startWith(total.value), takeUntil(this._dateUpdate$), takeUntilDestroyed(this._destroyRef))
            .subscribe((value) => {
                const result = _calculateOpeningAndClosingBalance(value);
                openingBalance.patchValue(result.openingBalance);
                closingBalance.patchValue(result.closingBalance);
            });

        return form;
    }

    _initMonthForm(months: string[]) {
        return this._fb.array<null | number>(months.map(() => null));
    }

    _initCategoryForm(name = '', months: string[]) {
        return this._fb.group({
            // Prevent unnecessary updates
            name: [name, { updateOn: 'submit' }],
            amounts: this._initMonthForm(months),
        });
    }

    _initCategoryGroupForm(months: string[], group: CategoryGroup) {
        const categories = [];

        for (const category of group.items) {
            const categoryForm = this._initCategoryForm(category, months);
            categories.push(categoryForm);
        }

        const form = this._fb.group({
            name: [group.name],
            categories: this._fb.array(categories),
            subtotals: this._initMonthForm(months),
        });

        form.controls.categories.valueChanges
            .pipe(
                debounceTime(150),
                map((categories) =>
                    _flattenAndSumColumns(categories.map((category) => category.amounts).filter((item) => !!item)),
                ),
                takeUntil(this._dateUpdate$),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe((value) => {
                form.controls.subtotals.patchValue(value);
            });

        return form;
    }
}
