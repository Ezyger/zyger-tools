import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonFormatter } from './json-formatter';

describe('JsonFormatter', () => {
  let component: JsonFormatter;
  let fixture: ComponentFixture<JsonFormatter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonFormatter],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonFormatter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats valid JSON and clears the error message', () => {
    component.inputText.set('{"a":1}');
    component.format();
    expect(component.outputText()).toBe('{\n  "a": 1\n}');
    expect(component.errorMessage()).toBeNull();
  });

  it('sets an error message for invalid JSON', () => {
    component.inputText.set('{a:1}');
    component.format();
    expect(component.outputText()).toBe('');
    expect(component.errorMessage()).toBe('O JSON informado possui um erro de sintaxe.');
  });

  it('minifies valid JSON', () => {
    component.inputText.set('{\n  "a": 1\n}');
    component.minify();
    expect(component.outputText()).toBe('{"a":1}');
  });

  it('clears input, output and error state', () => {
    component.inputText.set('{"a":1}');
    component.format();
    component.clear();
    expect(component.inputText()).toBe('');
    expect(component.outputText()).toBe('');
    expect(component.errorMessage()).toBeNull();
  });
});
