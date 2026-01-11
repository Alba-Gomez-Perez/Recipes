import {TestBed} from '@angular/core/testing';
import {App} from './app';
import {TranslateModule} from '@ngx-translate/core';
import {provideRouter} from '@angular/router';
import {FilterService} from './core/services/filter.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        FilterService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
