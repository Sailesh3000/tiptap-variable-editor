import React, { useState, useEffect, useRef, forwardRef } from 'react';

const VariableList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef(null);

  const selectItem = index => {
    const item = props.items[index];

    if (item) {
      props.command({
        id: item.id,
        label: item.label
      });
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
    if (listRef.current && listRef.current.children[selectedIndex + 1]) {
      listRef.current.children[selectedIndex + 1].scrollIntoView({ block: 'nearest' });
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

  // Group items by category if they have one
  const groupedItems = props.items.reduce((acc, item) => {
    const category = item.category || 'Variables';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const renderGroups = () => {
    const groups = Object.keys(groupedItems);
    if (groups.length <= 1) {
      return props.items.map((item, index) => (
        <div 
          key={index}
          className={`item ${index === selectedIndex ? 'is-selected' : ''}`}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <span className="item-label">{item.label}</span>
          <span className="item-id">{item.id}</span>
        </div>
      ));
    }

    let flatIndex = 0;
    return groups.map(group => (
      <React.Fragment key={group}>
        <div className="group-header">{group}</div>
        {groupedItems[group].map((item) => {
          const currentIndex = flatIndex++;
          return (
            <div 
              key={currentIndex}
              className={`item ${currentIndex === selectedIndex ? 'is-selected' : ''}`}
              onClick={() => selectItem(currentIndex)}
              onMouseEnter={() => setSelectedIndex(currentIndex)}
            >
              <span className="item-label">{item.label}</span>
              <span className="item-id">{item.id}</span>
            </div>
          );
        })}
      </React.Fragment>
    ));
  };

  if (props.items.length === 0) {
    return (
      <div className="items-list empty">
        No variables found
      </div>
    );
  }

  return (
    <div className="items-list" ref={listRef}>
      <div className="list-header">
        {props.title || 'Select a variable'}
      </div>
      {renderGroups()}
    </div>
  );
});

export default VariableList;