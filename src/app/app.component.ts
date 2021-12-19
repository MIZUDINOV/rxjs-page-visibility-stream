import { DOCUMENT } from '@angular/common';
import { Component, Inject, inject, InjectionToken } from '@angular/core';
import {
    distinctUntilChanged,
    fromEvent,
    map,
    Observable,
    share,
    startWith,
} from 'rxjs';

// Создаём наблюдаемый холодный токен для внедрения с фабрикой, которая возвращает наблюдаемое булево значение

var PAGE_VISIBLE = new InjectionToken<Observable<boolean>>(
    'PAGE_VISIBILITY_STREAM',
    {
        // Создаём фабрику
        factory: () => {
            // Создаём наш источник(Producer) для наблюдаемого объекта
            let documentRef = inject(DOCUMENT);

            // Создаем событие для слежки за видимосью страницы и применяем операторы
            return fromEvent(documentRef, 'visibilitychange').pipe(
                // Этот оператор нам нужен для того, чтобы запустить наш поток при первой загрузке страницы.
                // Можно передать в него любое значение так как оно будет преобразовано следующим оператором в булево значение
                startWith(0),

                // Заменяем наше предыдущее знаяение на булево, в зависимости от условия в переданной нами функции
                map(() => {
                    console.log('page visible:', documentRef.visibilityState);
                    return documentRef.visibilityState !== 'hidden';
                }),

                // Проверяем, пропускать значение или нет, если значение отличается от предыдущего пропускаем дальше, иначе, нет
                distinctUntilChanged(),

                // Делимся нашим одним потом между всеми подписчиками, если таковые будут
                share()
            );
        },
    }
);
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        // Внедряем наш токен в наблюдаемое свойство только для чтения pageVisibility$,
        // которое возвращает булево значение
        @Inject(PAGE_VISIBLE) readonly pageVisibility$: Observable<boolean>
    ) {}
}
