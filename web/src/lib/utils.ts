import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Essa função recebe várias classes e junta tudo em uma string, removendo classes conflitantes se existirem
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
