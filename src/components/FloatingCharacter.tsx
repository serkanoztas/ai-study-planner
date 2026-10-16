// src/components/FloatingCharacter.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FloatingCharacter() {
    return (
        <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className="hidden sm:block w-24 h-24 md:w-48 md:h-48 relative drop-shadow-2xl"
        >
            <Image
                src="/ai-character.png"
                alt="AI Study Coach"
                fill
                className="object-contain"
                priority
            />
        </motion.div>
    );
}