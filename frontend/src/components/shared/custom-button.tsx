import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    type?: ButtonType;
    variant?: 'default' | 'outline';
    htmlType?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

type ButtonType = 'import' | 'export' | 'upload' | 'submit' | 'delete' | 'cancel' | 'default';

interface StyleConfig {
    default: string;
    outline: string;
}

const BUTTON_STYLES: Record<ButtonType, StyleConfig> = {
    import: {
        default: 'bg-blue-600 hover:bg-blue-700 text-white',
        outline: 'border-blue-200 text-blue-600 hover:bg-blue-50',
    },
    export: {
        default: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        outline: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
    },
    upload: {
        default: 'bg-blue-600 hover:bg-blue-700 text-white',
        outline: 'border-blue-200 text-blue-600 hover:bg-blue-50',
    },
    submit: {
        default: 'bg-green-600 hover:bg-green-700 text-white',
        outline: 'border-green-200 text-green-600 hover:bg-green-50',
    },
    delete: {
        default: 'bg-red-600 hover:bg-red-700 text-white',
        outline: 'border-red-200 text-red-600 hover:bg-red-50',
    },
    cancel: {
        default: 'bg-gray-500 hover:bg-gray-600 text-white',
        outline: 'border-gray-300 text-gray-600 hover:bg-gray-50',
    },
    default: {
        default: 'bg-slate-700 hover:bg-slate-800 text-white',
        outline: 'border-gray-200 text-gray-600 hover:bg-gray-50',
    },
};
function CustomButton({
    icon: Icon,
    label,
    onClick,
    type = 'default',
    variant = 'default',
    htmlType = 'button',
    disabled = false,
}: ActionButtonProps) {
    const baseStyle = 'gap-2 h-11 px-6 transition-all duration-200 shadow-sm hover:shadow-md';
    const colorStyle = BUTTON_STYLES[type][variant];

    return (
        <Button
            type={htmlType}
            onClick={onClick}
            variant={variant}
            disabled={disabled}
            className={`${baseStyle} ${colorStyle}`}
        >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{label}</span>
        </Button>
    );
}


export default CustomButton;