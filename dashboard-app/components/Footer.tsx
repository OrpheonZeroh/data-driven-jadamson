import { Linkedin, Github, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Creator Info */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              Hecho por{' '}
              <a
                href="https://www.linkedin.com/in/jonathan-albert-adamson-gondola-57145084/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-500 font-semibold transition-colors inline-flex items-center gap-1"
              >
                Jonathan Adamson
                <Linkedin className="h-4 w-4" />
              </a>
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Data-Driven Analytics Dashboard
            </p>
          </div>

          {/* Repository Link */}
          <div className="text-center md:text-right">
            <a
              href="https://github.com/OrpheonZeroh/data-driven-jadamson"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <Github className="h-4 w-4" />
              <span>View Source Code</span>
            </a>
            <p className="text-gray-600 text-xs mt-1">
              Open Source • Portfolio Project
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
