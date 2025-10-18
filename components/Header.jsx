import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  PenBox,
  StarsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { checkUser } from "@/lib/checkUser";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async  function Header() {
  await checkUser();
  return (
    <header
      className=" fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 
     supports-[backdrop-filter]:bg-background/60"
    >
      <nav className=" container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <h1 className=" text-3xl font-semibold">ElevateAI</h1>
        </Link>
        <div className=" flex items-center space-x-2">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline">
                <LayoutDashboard className="h-4 w-4" />
                <span className=" hidden md:block">Industry Insights</span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <StarsIcon className=" h-4 w-4" />
                  <span className=" hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link href="/resume" className=" flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Build Resume</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href="/ai-cover-letter"
                    className=" flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    <span>Ai Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/interview" className=" flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Interview Prep</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                variables: {
                  avatarSize: "48px", // avatar size (if this still doesn’t work, fall back to CSS override with !important)
                },
                elements: {
                  userPreviewMainIdentifier: "font-semibold", // <-- makes the text semi-bold
                  userButtonPopoverCard: "shadow-xl", // optional styling for the dropdown
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
}
