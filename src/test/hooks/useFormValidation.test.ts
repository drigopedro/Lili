import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../hooks/useFormValidation';

describe('useFormValidation', () => {
  const initialData = {
    email: '',
    password: '',
    name: '',
  };

  const rules = {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLength: 8 },
    name: { required: true, minLength: 2 },
  };

  it('initializes with provided data', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('updates field value', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.data.email).toBe('test@example.com');
  });

  it('validates field on blur when validateOnBlur is true', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules, { validateOnBlur: true })
    );

    act(() => {
      result.current.setValue('email', 'invalid-email');
      result.current.setFieldTouched('email');
    });

    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.touched.email).toBe(true);
  });

  it('validates field on change when validateOnChange is true', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules, { validateOnChange: true })
    );

    act(() => {
      result.current.setValue('email', 'invalid-email');
    });

    expect(result.current.errors.email).toBeTruthy();
  });

  it('submits form with valid data', async () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    const mockSubmit = vi.fn().mockResolvedValue(undefined);

    // Set valid data
    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'Password123');
      result.current.setValue('name', 'John Doe');
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit(mockSubmit);
    });

    expect(submitResult).toBe(true);
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
      name: 'John Doe',
    });
  });

  it('prevents submission with invalid data', async () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    const mockSubmit = vi.fn();

    let submitResult;
    await act(async () => {
      submitResult = await result.current.submit(mockSubmit);
    });

    expect(submitResult).toBe(false);
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it('resets form data', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setFieldTouched('email');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it('provides field props for easy integration', () => {
    const { result } = renderHook(() =>
      useFormValidation(initialData, rules)
    );

    const emailProps = result.current.getFieldProps('email');

    expect(emailProps).toHaveProperty('value');
    expect(emailProps).toHaveProperty('onChange');
    expect(emailProps).toHaveProperty('onBlur');
    expect(emailProps).toHaveProperty('error');
  });
});