import React from 'react';
import './AppInput.css';

const AppInput = (props: {
  placeholder: string,
  text: string,
  password?: boolean;
  error?: boolean;
  onTextChanged: (text: string) => void,
  onSubmit?: () => void;
}) => {
  return (
    <input type={ props.password ? 'password' : 'text' } className={ `app-input${ props.error ? ' error' : '' }` }
      placeholder={ props.placeholder } value={ props.text } onChange={ (event) => {
        props.onTextChanged(event.target.value);
      } } onKeyDown={ (event) => {
        if (event.keyCode === 13 && !!props.onSubmit) {
          event.preventDefault(); props.onSubmit();
        }
      } } autoComplete="off" />
  );
};

export default AppInput;
