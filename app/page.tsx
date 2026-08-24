import { redirect } from "next/navigation";

// Root "/" redirects to the library
export default function Home() {
  redirect("/library");
}
