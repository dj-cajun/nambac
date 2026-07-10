import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GAP_PX = 12;
const MIN_COL_WIDTH = 148;

function estimatePinHeight(item, aspectRatio, colWidth) {
  const ratio = aspectRatio > 0 ? aspectRatio : 0.72;
  return colWidth / ratio;
}

function balanceColumns(items, colCount, aspects, colWidth) {
  const cols = Array.from({ length: colCount }, () => ({ items: [], height: 0 }));

  for (const item of items) {
    let target = 0;
    for (let i = 1; i < colCount; i += 1) {
      if (cols[i].height < cols[target].height) target = i;
    }
    const pinHeight = estimatePinHeight(item, aspects[item.id], colWidth);
    cols[target].items.push(item);
    cols[target].height += pinHeight + GAP_PX;
  }

  return cols.map((col) => col.items);
}

/** Pinterest-style masonry: shortest column, image aspect ratio drives height */
export default function KhoeMasonry({ items, renderItem }) {
  const rootRef = useRef(null);
  const [colCount, setColCount] = useState(2);
  const [containerWidth, setContainerWidth] = useState(0);
  const [aspects, setAspects] = useState({});

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;

    const update = (width) => {
      const w = Math.max(0, width);
      setContainerWidth(w);
      const nextCols = Math.max(2, Math.min(5, Math.floor((w + GAP_PX) / (MIN_COL_WIDTH + GAP_PX))));
      setColCount(nextCols);
    };

    update(node.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      update(entries[0]?.contentRect?.width || 0);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const colWidth = colCount > 0
    ? (containerWidth - GAP_PX * (colCount - 1)) / colCount
    : 0;

  const columns = useMemo(
    () => balanceColumns(items, colCount, aspects, colWidth),
    [items, colCount, aspects, colWidth],
  );

  const registerAspect = useCallback((id, ratio) => {
    if (!id || !Number.isFinite(ratio) || ratio <= 0) return;
    setAspects((prev) => {
      const rounded = Math.round(ratio * 1000) / 1000;
      if (prev[id] === rounded) return prev;
      return { ...prev, [id]: rounded };
    });
  }, []);

  return (
    <div className="lq-masonry" ref={rootRef}>
      {columns.map((colItems, colIndex) => (
        <div key={`col-${colIndex}`} className="lq-masonry-col">
          {colItems.map((item) => renderItem(item, registerAspect))}
        </div>
      ))}
    </div>
  );
}
