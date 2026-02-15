import { useState, useCallback } from 'react';

const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleOnChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const next = type === 'checkbox' ? e.target.checked : value;
    setValues((prev) => ({ ...prev, [name]: next }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, setValues, errors, setErrors, handleOnChange, reset };
};

export default useForm;
