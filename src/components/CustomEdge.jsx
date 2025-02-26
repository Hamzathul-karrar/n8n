import { useState, useCallback } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import PropTypes from 'prop-types';
import './CustomEdge.css';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = useCallback(
    (evt) => {
      evt.stopPropagation();
      if (data?.onDelete) {
        data.onDelete(id);
      }
    },
    [id, data]
  );

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      </g>
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="edge-delete-button show"
          >
            <IconButton
              size="small"
              onClick={onEdgeClick}
              className="edge-button"
            >
              <Delete fontSize="small" />
            </IconButton>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

CustomEdge.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.string.isRequired,
  targetPosition: PropTypes.string.isRequired,
  style: PropTypes.object,
  markerEnd: PropTypes.string,
  data: PropTypes.shape({
    onDelete: PropTypes.func,
  }),
};
