import { memo } from 'react';
import { FixedSizeList } from 'react-window';

/**
 * Virtualized list component for rendering long lists efficiently
 * Only renders visible items, dramatically improving performance for 100+ items
 */
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  height = 400,
  itemHeight = 80,
  overscanCount = 5,
}) => {
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      overscanCount={overscanCount}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

