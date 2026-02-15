export { default as Forms, validateMessages } from './Forms';
export { default as UseInput } from './UseInput';
export { default as UseSelect } from './UseSelect';
import UseInput from './UseInput';
import UseSelect from './UseSelect';

export const Controls = {
  Input: UseInput,
  Select: UseSelect
};
