import { useState, useCallback, useMemo } from 'react';
import { ValidationRules, ValidationErrors, validateForm, hasValidationErrors } from '../utils/validation';

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T,
  rules: ValidationRules,
  options: UseFormValidationOptions = {}
) => {
  const { validateOnChange = false, validateOnBlur = true } = options;
  
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName: string, value: any) => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return null;

    const fieldErrors = validateForm({ [fieldName]: value }, { [fieldName]: fieldRules });
    return fieldErrors[fieldName] || null;
  }, [rules]);

  const validateAllFields = useCallback(() => {
    const allErrors = validateForm(data, rules);
    setErrors(allErrors);
    return allErrors;
  }, [data, rules]);

  const setValue = useCallback((fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));

    if (validateOnChange) {
      const fieldError = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError || '',
      }));
    }
  }, [validateField, validateOnChange]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const fieldError = validateField(fieldName, data[fieldName]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError || '',
      }));
    }
  }, [data, validateField, validateOnBlur]);

  const handleChange = useCallback((fieldName: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
    
    setValue(fieldName, value);
  }, [setValue]);

  const handleBlur = useCallback((fieldName: string) => () => {
    setFieldTouched(fieldName);
  }, [setFieldTouched]);

  const reset = useCallback((newData?: Partial<T>) => {
    setData(newData ? { ...initialData, ...newData } : initialData);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialData]);

  const submit = useCallback(async (onSubmit: (data: T) => Promise<void>) => {
    setIsSubmitting(true);
    
    try {
      const allErrors = validateAllFields();
      
      if (hasValidationErrors(allErrors)) {
        // Mark all fields as touched to show errors
        const allTouched = Object.keys(rules).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setTouched(allTouched);
        return false;
      }

      await onSubmit(data);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, rules, validateAllFields]);

  const isValid = useMemo(() => {
    return !hasValidationErrors(errors);
  }, [errors]);

  const getFieldProps = useCallback((fieldName: string) => ({
    value: data[fieldName] || '',
    onChange: handleChange(fieldName),
    onBlur: handleBlur(fieldName),
    error: touched[fieldName] ? errors[fieldName] : undefined,
  }), [data, errors, touched, handleChange, handleBlur]);

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    reset,
    submit,
    validateField,
    validateAllFields,
    getFieldProps,
  };
};