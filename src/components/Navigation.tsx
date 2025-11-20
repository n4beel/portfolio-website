
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const leftNavItems = [
    { name: 'About', href: '#about' },
    { name: 'Work', href: '#projects' },
    { name: 'Experience', href: '#experience' },
];

const rightNavItems = [
    { name: 'Education', href: '#' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: 'mailto:contact@nabeelkhan.dev' },
];

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNav = () => setIsOpen(!isOpen);

    return (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="relative flex items-center justify-center pointer-events-auto">
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex items-center rounded-lg overflow-hidden h-10 ${isOpen ? 'bg-gray-100 px-1 shadow-sm' : 'bg-white shadow-md'}`}
                    style={{ minWidth: '40px' }}
                >
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="flex items-center overflow-hidden"
                            >
                                {leftNavItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md whitespace-nowrap transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        layout
                        onClick={toggleNav}
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-all focus:outline-none z-10 shrink-0 ${isOpen ? 'hover:bg-white hover:shadow-sm mx-1' : 'hover:bg-gray-50'}`}
                        aria-label={isOpen ? "Close Navigation" : "Open Navigation"}
                    >
                        <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Plus size={20} className="text-gray-600" />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="flex items-center overflow-hidden"
                            >
                                {rightNavItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md whitespace-nowrap transition-colors"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
