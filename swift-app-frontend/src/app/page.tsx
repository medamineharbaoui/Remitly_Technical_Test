'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TypeAnimation } from 'react-type-animation';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const fullText = `Dear Remitly Team,\n\nMy name is Mohamed Amine Harbaoui, a passionate software engineer with a strong background in full-stack development. I am incredibly grateful for the opportunity to work on this technical test for Remitly. I thoroughly enjoyed designing and implementing both the backend and frontend components, and I hope this submission showcases my skills and enthusiasm for joining your team.`;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-[#F5F6F5] to-[#E0ECEF] ${inter.className}`}
    >
      <main className="max-w-3xl w-full flex flex-col gap-8 text-center">
        {/* Logo and Button in the same div */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Image
            src="/images/logo.png"
            alt="Remitly Logo"
            width={180}
            height={38}
            priority
            className="object-contain"
          />
          <Link href="/dashboard">
            <button
              className="px-6 py-3 bg-[#00A7B5] text-white rounded-full font-semibold text-lg hover:bg-[#005670] transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Explore SwiftCodes App
            </button>
          </Link>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <TypeAnimation
            sequence={[fullText, 1000]}
            wrapper="p"
            speed={50}
            style={{
              whiteSpace: 'pre-line',
              fontSize: '1.125rem',
              color: '#333',
              lineHeight: '1.75',
            }}
            repeat={0}
            cursor={false}
            preRenderFirstString={false}
          />
        </div>

        {/* Approach */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-left">
          <h3 className="text-xl font-semibold text-[#005670] mb-4">My Approach</h3>
          <p className="text-base text-[#333] mb-4 leading-relaxed">
            For the backend, I developed a robust REST API using <span className="font-medium">Spring Boot</span> with <span className="font-medium">Java</span>, leveraging <span className="font-medium">Hibernate ORM</span> for seamless database interactions with a <span className="font-medium">MySQL</span> database. The application is containerized using <span className="font-medium">Docker</span> to ensure consistent deployment across environments. The source code is managed on <span className="font-medium">GitHub</span> for version control and collaboration, facilitating easy review and iteration.
          </p>
          <p className="text-base text-[#333] mb-4 leading-relaxed">
            To enhance usability for the recruiter, I implemented a frontend using <span className="font-medium">Next.js</span>, styled with <span className="font-medium">Material-UI</span> and <span className="font-medium">Tailwind CSS</span>. The frontend features two main components: the <span className="font-medium">SwiftCodeTable</span> provides a responsive, interactive interface for searching, viewing, and deleting SWIFT codes, with pagination, address truncation with a clickable ellipsis, and a dialog to display full addresses. The <span className="font-medium">Form</span> component allows users to add new SWIFT codes with real-time validation and import multiple codes via CSV upload, ensuring a user-friendly experience.
          </p>
          <p className="text-base text-[#333] leading-relaxed">
            The frontend communicates with the backend via <span className="font-medium">Axios</span>, ensuring a seamless user experience. This full-stack solution demonstrates my ability to deliver a polished, end-to-end application.
          </p>
        </div>

        {/* Covered Cases */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-left">
          <h3 className="text-xl font-semibold text-[#005670] mb-4">API Endpoints and Cases Covered</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#333] mb-2">GET /v1/swift-codes/[swiftCode]</h4>
            <p className="text-base text-[#333] mb-2 leading-relaxed">
              Retrieves details of a specific SWIFT code, including its address, bank name, country information, and branch list (if the code represents a headquarter).
            </p>
            <ul className="list-disc pl-5 text-base text-[#333] leading-relaxed">
              <li>Validates SWIFT code format (11 characters, matches regex).</li>
              <li>Returns 404 if the SWIFT code is not found.</li>
              <li>Includes list of branches if the code ends with {"XXX"} (headquarter).</li>
              <li>Returns structured information in JSON format.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#333] mb-2">GET /v1/swift-codes/country/[countryISO2code]</h4>
            <p className="text-base text-[#333] mb-2 leading-relaxed">
              Fetches all SWIFT codes associated with a specific country using its ISO2 code.
            </p>
            <ul className="list-disc pl-5 text-base text-[#333] leading-relaxed">
              <li>Validates the ISO2 country code.</li>
              <li>Returns 404 if no SWIFT codes are found for the country.</li>
              <li>Returns the country name and a list of SWIFT code details.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#333] mb-2">POST /v1/swift-codes</h4>
            <p className="text-base text-[#333] mb-2 leading-relaxed">
              Adds a new SWIFT code to the database.
            </p>
            <ul className="list-disc pl-5 text-base text-[#333] leading-relaxed">
              <li>Validates SWIFT code format and country ISO2 code.</li>
              <li>Ensures the country name matches the ISO2 code.</li>
              <li>Checks that the SWIFT code does not already exist (returns 409 if it does).</li>
              <li>Ensures headquarter logic is respected (only {"XXX"} suffix can be a headquarter).</li>
              <li>Returns the created entity with status 201 Created.</li>
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#333] mb-2">DELETE /v1/swift-codes/[swiftCode]</h4>
            <p className="text-base text-[#333] mb-2 leading-relaxed">
              Deletes an existing SWIFT code from the database.
            </p>
            <ul className="list-disc pl-5 text-base text-[#333] leading-relaxed">
              <li>Validates the format of the SWIFT code.</li>
              <li>Returns 404 if the code does not exist.</li>
              <li>Deletes the code if found and returns a success message.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-medium text-[#333] mb-2">POST /v1/swift-codes/import</h4>
            <p className="text-base text-[#333] mb-2 leading-relaxed">
              Imports SWIFT codes from a default CSV file on the server.
            </p>
            <ul className="list-disc pl-5 text-base text-[#333] leading-relaxed">
              <li>Handles IOException and returns 500 Internal Server Error if the import fails.</li>
              <li>Returns a success message when the import completes successfully.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}