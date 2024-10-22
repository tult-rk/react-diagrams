import React from 'react';

interface PortIconProps {
	color: string;
}

const Triangle = ({ color }: PortIconProps) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.60364 5.1467L3.52164 1.4302C2.85514 1.0227 2.00014 1.5022 2.00014 2.2832L2.00014 9.7172C2.00014 10.4982 2.85514 10.9777 3.52164 10.5707L9.60364 6.8537C10.2421 6.4637 10.2421 5.5367 9.60364 5.1467Z"
			fill={color}
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const Rhombus = ({ color }: PortIconProps) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5.35216 10.3488L1.65116 6.64784C1.29316 6.28984 1.29316 5.70934 1.65116 5.35134L5.35216 1.65034C5.71016 1.29234 6.29066 1.29234 6.64866 1.65034L10.3497 5.35134C10.7077 5.70934 10.7077 6.28984 10.3497 6.64784L6.64866 10.3488C6.29016 10.7068 5.71016 10.7068 5.35216 10.3488Z"
			fill={color}
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const Round = ({ color }: PortIconProps) => (
	<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M9.18198 9.18197C7.42462 10.9393 4.57538 10.9393 2.81803 9.18197C1.06067 7.42461 1.06067 4.57537 2.81803 2.81802C4.57539 1.06066 7.42463 1.06066 9.18198 2.81802C10.9393 4.57538 10.9393 7.42462 9.18198 9.18197Z"
			fill={color}
		/>
		<path
			d="M9.18198 9.18197C7.42462 10.9393 4.57538 10.9393 2.81803 9.18197C1.06067 7.42461 1.06067 4.57537 2.81803 2.81802C4.57539 1.06066 7.42463 1.06066 9.18198 2.81802C10.9393 4.57538 10.9393 7.42462 9.18198 9.18197"
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export { Triangle, Rhombus, Round };
