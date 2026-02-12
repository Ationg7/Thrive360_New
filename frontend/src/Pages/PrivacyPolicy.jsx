import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './LegalPages.css';

function PrivacyPolicy() {
  return (
    <Container className="legal-page my-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="mb-4">Privacy Policy</h1>
          
          <section className="mb-5">
            <h2>1. Introduction</h2>
            <p>
              Thrive360 operates the Thrive360 website. This page informs you of our 
              policies regarding the collection, use, and disclosure of personal data when you use our Service 
              and the choices you have associated with that data.
            </p>
          </section>

          <section className="mb-5">
            <h2>2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve 
              our Service to you.</p>
            
            <h3>Types of Data Collected:</h3>
            <ul>
              <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with 
              certain personally identifiable information that can be used to contact or identify you. 
              This may include, but is not limited to:
                <ul>
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Cookies and Usage Data</li>
                </ul>
              </li>
              <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed 
              and used. This may include information such as your computer's Internet Protocol 
              address, browser type, browser version, the pages you visit, the time and date of your visit, 
              the time spent on those pages, and other diagnostic data.</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>3. Use of Data</h2>
            <p>Thrive360 uses the collected data for various purposes:</p>
            <ul>
              <li>To provide and maintain the Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer care and support</li>
              <li>To gather analysis or valuable information so that we can improve the Service</li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>4. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over 
              the Internet or method of electronic storage is 100% secure. While we strive to use commercially 
              acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-5">
            <h2>5. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date at the bottom of this Privacy Policy.
            </p>
          </section>

          <section className="mb-5">
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul>
              <li>By email: <strong>gibbi382@gmail.com</strong></li>
            </ul>
          </section>

          <p className="text-muted small">Last updated: December 2025</p>
        </Col>
      </Row>
    </Container>
  );
}

export default PrivacyPolicy;
