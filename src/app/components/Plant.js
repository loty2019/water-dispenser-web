import React, { useState, useEffect } from 'react';

const Plant = ({ percentage }) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const validPercentage = Math.max(0, Math.min(100, Number(percentage)));
    const newHeight = validPercentage * 5; // Adjust this for height growth rate
    setHeight(newHeight);
  }, [percentage]);

  const plantContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '500px', // Adjust based on your container size
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  };

  const plantStemStyle = {
    backgroundColor: '#7B3F00', // Stem color
    width: '10px', // Stem width
    height: `${height}px`,
    transition: 'height 0.3s ease',
    position: 'absolute',
    bottom: '0'
  };

  // Function to render leaves
  const renderLeaves = (height) => {
    const leaves = [];
    const leafSize = 20; // Size of the leaves

    for (let i = 50; i <= height; i += 100) { // Adjust for leaf frequency
      const leafStyle = {
        position: 'absolute',
        bottom: `${i - leafSize / 2}px`, // Positioning the leaf
        backgroundColor: '#228B22', // Leaf color
        width: `${leafSize}px`,
        height: `${leafSize}px`,
        borderRadius: '50%',
        transform: `rotate(${i % 200 === 0 ? '-' : ''}45deg)` // Alternating leaf rotation
      };

      // Positioning leaves on alternate sides
      leafStyle.left = i % 200 === 0 ? '-10px' : undefined;
      leafStyle.right = i % 200 !== 0 ? '-10px' : undefined;

      leaves.push(<div key={`leaf-${i}`} style={leafStyle} />);
    }

    return leaves;
  };

  return (
    <div style={plantContainerStyle}>
      <div style={plantStemStyle}>
        {renderLeaves(height)}
      </div>
    </div>
  );
};

export default Plant;
