import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

const EditIcon = (props) => (
    <Svg
        width={24}
        height={24}
        viewBox="0 0 264.58332 264.58334"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Rect
            width="264.58334"
            height="264.58334"
            fill="#f7f7f7"
        />
        <Path
            d="M174.27 140.585v47.916a5 5 0 0 1-5 5H76.082a5 5 0 0 1-5-5V95.314a5 5 0 0 1 5-5h47.917"
            stroke="#0573e1"
            strokeWidth={9.26}
        />
        <Rect
            x="175.182"
            y="-59.799"
            width="23.812"
            height="71.437"
            transform="rotate(45)"
            stroke="#4d4d4d"
            strokeWidth={7.9375}
        />
        <Path
            d="M115.643 132.102l16.838 16.838-2.089 2.089-23.76 6.922 6.922-23.76z"
            stroke="#4d4d4d"
            strokeWidth={7.9375}
        />
        <Path
            d="M185.659 73.4l5.524 5.524a8 8 0 0 1 0 11.314l-8.188 8.188-16.838-16.838 8.188-8.188a8 8 0 0 1 11.314 0z"
            stroke="#4d4d4d"
            strokeWidth={7.9375}
        />
    </Svg>
);

export default EditIcon;
