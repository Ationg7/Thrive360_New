import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './LegalPages.css';

function TermsOfService() {
  return (
    <Container className="legal-page my-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="mb-4">Terms of Service</h1>
          
          <section className="mb-5">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Thrive360 website and services, you accept and agree to be bound by 
              and comply with these terms and conditions of service. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-5">
            <h2>2. User Responsibilities</h2>
            <p>As a user of Thrive360, you are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account and password</li>
              <li>Accepting responsibility for all activities that occur under your account</li>
              <li>Ensuring that your use of the Service is legal and does not violate any applicable laws or regulations</li>
              <li>Not using the Service for any illegal or unauthorized purpose</li>
              <li>Not harassing, abusing, or harming another person through the Service</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>3. Intellectual Property Rights</h2>
            <p>
              Unless otherwise stated, Thrive360 and/or its licensors own the intellectual property rights 
              for all material on this website. All intellectual property rights are reserved. You may view 
              and print pages from the website for personal use, subject to restrictions set in these terms and conditions.
            </p>
          </section>

          <section className="mb-5">
            <h2>4. User-Generated Content</h2>
            <p>
              You retain all rights to any content you submit, post or display on or through the Service. 
              By submitting, posting or displaying content on or through the Service, you grant us a worldwide, 
              non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, 
              transmit, display and distribute such content in any media or medium and for any purposes.
            </p>
          </section>

          <section className="mb-5">
            <h2>5. Prohibited Uses</h2>
            <p>You agree not to use the Service:</p>
            <ul>
              <li>To transmit any harmful, abusive, defamatory, obscene, or otherwise objectionable material</li>
              <li>To impersonate or attempt to impersonate any person or entity</li>
              <li>To upload, post, transmit or otherwise make available any unsolicited or unauthorized advertising, 
              promotional materials, "junk mail," "spam," or any other form of solicitation</li>
              <li>To access or search the Service by any means other than our publicly supported interfaces</li>
              <li>To interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall Thrive360, its directors, employees, or agents be liable to you for any direct, 
              indirect, incidental, special, punitive, or consequential damages whatsoever resulting from any 
              errors, mistakes, or inaccuracies of content, personal injury or property damage, or 
              any other matter relating to your use of the Service.
            </p>
          </section>

          <section className="mb-5">
            <h2>7. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Thrive360 and its officers, directors, employees, 
              and agents from and against all claims, liabilities, damages, losses, and expenses arising out of your 
              use of the Service or violation of these terms.
            </p>
          </section>

          <section className="mb-5">
            <h2>8. Termination</h2>
            <p>
              Thrive360 may terminate or suspend your account and access to the Service immediately, without 
              prior notice or liability, for any reason whatsoever, including if you breach the Terms.
            </p>
          </section>

          <section className="mb-5">
            <h2>9. Modifications to Terms</h2>
            <p>
              Thrive360 may modify these Terms at any time. The modified Terms will be effective upon posting 
              to the website. Your continued use of the Service following the posting of modified Terms will 
              constitute your acceptance of and agreement to be bound by the modified Terms.
            </p>
          </section>

          <section className="mb-5">
            <h2>10. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at 
              <strong> gibbi382@gmail.com</strong>
            </p>
          </section>

          <p className="text-muted small">Last updated: December 2025</p>
        </Col>
      </Row>
    </Container>
  );
}

export default TermsOfService;
