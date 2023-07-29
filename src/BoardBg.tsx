import React, { memo } from 'react';

interface BoardBgProps {
  cols: number,
  rows: number,
  height: string,
}

const BoardBg = (props: BoardBgProps) => {
  const { cols, rows, height } = props;
  return (
    <svg width="100%" height={height} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="Gradient1">
          <stop offset="10%" stopColor="lightgrey" />
          <stop offset="90%" stopColor="grey" />
          <stop offset="100%" stopColor="darkgrey" />
        </linearGradient>

        <pattern id="Pattern" x="0" y="0" width={1/cols} height={1/rows}>
          <rect width={`${100/cols}%`} height={`${100/rows}%`} fill="url(#Gradient1)" fillOpacity="1" stroke="black" strokeWidth={1} />
        </pattern>
      </defs>

      <rect fill="url(#Pattern)" width="100%" height="100%" />
    </svg>
  );
}
export default memo(BoardBg);