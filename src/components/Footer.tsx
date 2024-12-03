import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-6 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/SusmitM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/susmit-mukherjee-5aa8211b5/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link
              href="https://x.com/SusmitMukherje5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by Susmit @2024
          </p>
        </div>
      </div>
    </footer>
  );
}