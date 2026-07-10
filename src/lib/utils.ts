import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Hide scrollbars while preserving scroll (WebKit, Firefox, legacy Edge). */
export const scrollbarHiddenClass =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";


// export function getErrorMessage(error: unknown): string {
//   const typedError = error as IErrorResponse;
  
//   // Log the error structure for debugging
//   if (import.meta.env.DEV) {
//     console.log('Error structure:', {
//       hasResponse: !!typedError?.response,
//       hasData: !!typedError?.response?.data,
//       data: typedError?.response?.data,
//       message: typedError?.response?.data?.message,
//       errors: typedError?.response?.data?.errors,
//     });
//   }
  
//   const errorObject = typedError?.response?.data?.errors;
//   const errorKeys = errorObject ? Object.keys(errorObject)[0] : null;

//   // Get the first error message
//   const firstError =
//     errorKeys && typeof errorObject === "object" && errorObject !== null
//       ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         (errorObject as Record<string, any>)[errorKeys][0]
//       : null;

//   // Check for message in response data
//   const responseMessage = typedError?.response?.data?.message;
//   const messageString = typeof responseMessage === 'string' 
//     ? responseMessage 
//     : Array.isArray(responseMessage) 
//       ? responseMessage[0] 
//       : null;

//   // If errors exist, show the first one
//   const errorString = errorObject
//     ? firstError || "Unknown error"
//     : messageString && messageString.length > 0
//     ? messageString
//     : typedError?.message || "An unexpected error occurred";

//   return errorString as string;
// }