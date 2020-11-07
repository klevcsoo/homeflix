import React from 'react';
import './AppButton.css';
import LoadingSpinner from '../LoadingSpinner';

const AppButton = (props: {
  text: string;
  type: 'primary' | 'secondary' | 'warning' | 'bottom-attached';
  working?: boolean;
  onClick: () => void;
}) => {
  const handler = () => setTimeout(() => props.onClick(), 200);
  return (
    <button type="button" className={ `app-button ${ props.type }${ props.working ? ' working' : '' }` }
      onClick={ handler }>
      { props.working ? (
        <div style={ { filter: props.type === 'secondary' ? 'none' : 'invert(1)' } }><LoadingSpinner /></div>
      ) : <h2>{ props.text }</h2> }
    </button>
  );
};

export default AppButton;
