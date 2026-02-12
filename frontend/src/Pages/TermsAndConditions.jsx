import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './LegalPages.css';

function TermsAndConditions() {
  return (
    <Container className="legal-page my-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="mb-4">Terms and Conditions</h1>
          
          <section className="mb-5">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Thrive360. These Terms and Conditions govern your access to and use of the Thrive360 website and services. By accessing 
              and using Thrive360, you accept and agree to be bound by and comply with these Terms.
            </p>
          </section>

          <section className="mb-5">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) 
              on Thrive360 for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on Thrive360</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>3. Disclaimer</h2>
            <p>
              The materials on Thrive360 are provided on an 'as is' basis. Thrive360 makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including, without 
              limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, 
              or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-5">
            <h2>4. Limitations</h2>
            <p>
              In no event shall Thrive360 or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use the materials on Thrive360, even if Thrive360 or a Thrive360 authorized representative has been 
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-5">
            <h2>5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Thrive360 could include technical, typographical, or photographic errors. 
              Thrive360 does not warrant that any of the materials on the website are accurate, complete, or current. 
              Thrive360 may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="mb-5">
            <h2>6. Links</h2>
            <p>
              Thrive360 has not reviewed all of the sites linked to its website and is not responsible for the 
              contents of any such linked site. The inclusion of any link does not imply endorsement by Thrive360 
              of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-5">
            <h2>7. Modifications</h2>
            <p>
              Thrive360 may revise these Terms and Conditions for its website at any time without notice. 
              By using this website, you are agreeing to be bound by the then current version of these 
              Terms and Conditions.
            </p>
          </section>

          <section className="mb-5">
            <h2>8. Governing Law</h2>
            <p>
              These Terms and Conditions and any separate agreements we may enter into to provide the Services 
              shall be governed by and construed in accordance with the laws of the jurisdiction in which the 
              Company is located.
            </p>
          </section>

          <section className="mb-5">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at
              <strong> gibbi382@gmail.com</strong>
            </p>
          </section>

          <p className="text-muted small">Last updated: December 2025</p>
        </Col>
      </Row>
    </Container>
  );
}

export default TermsAndConditions;
