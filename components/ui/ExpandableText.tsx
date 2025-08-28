import { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    maxLength?: number;
}

const ExpandableText = ({ text, maxLength = 50 }: ExpandableTextProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (text.length <= maxLength) {
        return <span>{text}</span>;
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <span>
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </span>
            <button onClick={toggleExpanded} className="text-blue-500 hover:underline ml-2">
                {isExpanded ? 'Leer menos' : 'Leer más'}
            </button>
        </div>
    );
};

export default ExpandableText;