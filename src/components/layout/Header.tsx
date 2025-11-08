
"use client";

import Link from "next/link";
import {
  Book,
  Heart,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  ShoppingCart,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dataApi } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { SearchBar } from "./SearchBar";

const guestLinks = [
  { href: "/courses", label: "Courses", icon: undefined },
];

const learnerLinks = [
  { href: "/learner/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/my-courses", label: "My Courses", icon: <Book className="w-4 h-4" /> },
  { href: "/courses", label: "Explore", icon: <Book className="w-4 h-4" /> },
  // { href: "/academic-growth", label: "Academic Growth", icon: <Book className="w-4 h-4" /> },
];

const instructorLinks = [
  { href: "/instructor/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/instructor/courses", label: "My Courses", icon: <Book className="w-4 h-4" /> },
];

export default function Header() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setCartCount(dataApi.getCartItems(currentUser.id).length);
    }
  }, [currentUser]);


  const getLinks = () => {
    if (!isAuthenticated) return guestLinks;
    return currentUser?.role === "instructor" ? instructorLinks : learnerLinks;
  };

  const navLinks = getLinks();

  const userAvatar = PlaceHolderImages.find(
    (img) => img.id === currentUser?.avatarId
  );

  const renderNavLinks = (isMobile = false) => (
    <nav
      className={
        isMobile
          ? "flex flex-col gap-4 text-lg"
          : "hidden md:flex md:gap-6 md:items-center"
      }
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          {isMobile && link.icon}
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="nav-item flex items-center">
              <img
                src="/logo/logo.png"
                alt="logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
          {renderNavLinks()}
          <div className="w-full max-w-sm">
            <SearchBar />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          {!isAuthenticated ? (
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <>
              {currentUser?.role === 'learner' && (
                <div className="hidden md:flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/wishlist"><Heart /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="relative">
                    <Link href="/cart">
                      <ShoppingCart />
                      {cartCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartCount}</Badge>}
                    </Link>
                  </Button>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar?.imageUrl} alt={currentUser?.name} />
                      <AvatarFallback>
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /> Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
           <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <PanelLeft />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
                <Logo className="mb-8" />
                <div className="mb-4">
                  <SearchBar />
                </div>
                {renderNavLinks(true)}
                 {!isAuthenticated ? (
                    <div className="flex flex-col gap-4 mt-8 border-t pt-4">
                        <Button variant="ghost" asChild>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                    </div>
                 ) : (
                    currentUser?.role === 'learner' && (
                      <div className="flex flex-col gap-4 mt-8 border-t pt-4">
                        <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</Link>
                        <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 && <Badge variant="destructive">{cartCount}</Badge>}
                        </Link>
                      </div>
                    )
                 )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
