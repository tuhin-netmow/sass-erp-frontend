import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router";

export default function Footer() {
    return (
        <footer className="border-t bg-[#f9f9f9] py-10">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
                    <div className="md:pr-8">
                        <div className="mb-4 flex items-center gap-2">
                            {/* <Image src={'/assets/img/kira-logo.png'} alt="Logo" width={100} height={100} /> */}
                            <img src={'/assets/img/kira-logo.png'} alt="Logo" width={100} height={100} />
                        </div>
                        <p className="mb-4 text-sm text-gray-600">
                            Complete business management solution with 23 powerful modules for modern enterprises.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-(--color-brand) transition-colors hover:bg-(--color-brand) hover:text-white">
                                <Facebook className="size-4" />
                            </a>
                            <a href="#" className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-(--color-brand) transition-colors hover:bg-(--color-brand) hover:text-white">
                                <Twitter className="size-4" />
                            </a>
                            <a href="#" className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-(--color-brand) transition-colors hover:bg-(--color-brand) hover:text-white">
                                <Linkedin className="size-4" />
                            </a>
                            <a href="#" className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-(--color-brand) transition-colors hover:bg-(--color-brand) hover:text-white">
                                <Instagram className="size-4" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 font-medium">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="#" className="text-gray-600 hover:text-gray-900">Features</Link></li>
                            <li><Link to="#" className="text-gray-600 hover:text-gray-900">Modules</Link></li>
                            <li><Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
                            <li><Link to="#" className="text-gray-600 hover:text-gray-900">Updates</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-medium">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-gray-900">Careers</Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-600 hover:text-gray-900">Blog</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-medium">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">API Reference</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">Community</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 font-medium">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms & Conditions</Link>
                            </li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">Cookie Policy</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-gray-900">GDPR</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t pt-4 text-center text-sm text-gray-600">
                    <p>© {new Date().getFullYear()} KIRA ERP Solution | Made with ❤️ by <a href="https://www.netmow.com" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">NETMOW</a> | All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
