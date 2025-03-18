// src/components/VariableList.jsx
import React, { useState, useEffect, useRef, forwardRef } from 'react';

const VariableList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const selectItem = index => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item.id, label: item.label });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const onKeyDown = ({ event }) => {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }

    return false;
  };

  React.useImperativeHandle(ref, () => ({
    onKeyDown,
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="variable-list" ref={listRef}>
      {props.items.map((item, index) => (
        <button
          className={`variable-item ${index === selectedIndex ? 'is-selected' : ''}`}
          key={item.id}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
});

export default VariableList;