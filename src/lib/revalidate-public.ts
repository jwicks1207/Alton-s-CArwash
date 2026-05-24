import { revalidatePath } from "next/cache";

/** Bust static cache for all public pages after admin content changes. */
export function revalidatePublicPages() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/gallery");
  revalidatePath("/testimonials");
}
