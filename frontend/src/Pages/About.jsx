import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './LegalPages.css';

function About() {
  return (
    <Container className="legal-page my-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <h1 className="mb-4">About Thrive360</h1>
          
          <section className="mb-5">
            <h2>Our Mission</h2>
            <p>
              Thrive360 is dedicated to supporting mental health and holistic wellness through an integrated, 
              user-friendly platform. Our mission is to empower individuals on their journey to emotional, 
              mental, and physical well-being by providing accessible resources, community support, and 
              professional guidance.
            </p>
          </section>

          <section className="mb-5">
            <h2>What We Offer</h2>
            <Row className="mt-4">
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">🧘 Meditation & Mindfulness</h5>
                    <p className="card-text">
                      Guided meditation sessions and mindfulness exercises to help you find peace and clarity 
                      in your daily life.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">🎯 Personal Challenges</h5>
                    <p className="card-text">
                      Engage in meaningful challenges designed to build resilience, boost confidence, 
                      and foster personal growth.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">📚 Wellness Blog</h5>
                    <p className="card-text">
                      Discover evidence-based articles on mental health, wellness tips, and expert insights 
                      to support your journey.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">🤝 Community Support</h5>
                    <p className="card-text">
                      Connect with others through our Freedom Wall, share experiences, and find support 
                      from a caring community.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">👨‍⚕️ Professional Guidance</h5>
                    <p className="card-text">
                      Access to qualified psychiatrists and mental health professionals for expert consultation 
                      and support.
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <h5 className="card-title">📅 Events</h5>
                    <p className="card-text">
                      Participate in interactive events, and webinars led by wellness experts 
                      and community leaders.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </section>

          <section className="mb-5">
            <h2>Our Team</h2>
            <p>
              Thrive360 was created by passionate developers and mental health advocates committed to making 
              wellness accessible to everyone. Our team combines technical expertise with a deep understanding 
              of mental health challenges to create a platform that truly makes a difference.
            </p>
            <p className="mt-3">
              <strong>Developed by: Ferlita Ationg & Chanlyn Sanchez</strong>
            </p>
          </section>

          <section className="mb-5">
            <h2>Our Values</h2>
            <ul>
              <li><strong>Empathy:</strong> We understand the challenges our users face and approach every 
              feature with compassion.</li>
              <li><strong>Accessibility:</strong> We believe mental health support should be available to everyone, 
              regardless of background or circumstances.</li>
              <li><strong>Privacy:</strong> Your mental health information is sacred to us. We maintain the highest 
              standards of data protection and confidentiality.</li>
              <li><strong>Innovation:</strong> We continuously improve and adapt our platform to better serve the 
              evolving needs of our community.</li>
              <li><strong>Community:</strong> We foster a safe, inclusive, and supportive environment where everyone 
              feels valued and heard.</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>Why Choose Thrive360?</h2>
            <ul>
              <li>Comprehensive platform combining multiple wellness resources in one place</li>
              <li>Professional guidance from qualified mental health practitioners</li>
              <li>Community-driven support and peer encouragement</li>
              <li>Evidence-based content and recommendations</li>
              <li>User-friendly interface designed for your convenience</li>
              <li>Commitment to your privacy and data security</li>
              <li>Continuous updates and improvements based on user feedback</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2>Get in Touch</h2>
            <p>
              Have questions or feedback? We'd love to hear from you. Reach out to us at:
            </p>
            <ul>
              <li>Email: <strong>gibbi382@gmail.com</strong></li>
            </ul>
          </section>

          <section className="mb-5">
            <div className="alert alert-info">
              <h5>Remember:</h5>
              <p className="mb-0">
                If you or someone you know is struggling with mental health, please reach out to a mental health 
                professional or crisis hotline. Your well-being matters, and help is always available.
              </p>
            </div>
          </section>

          <p className="text-muted small">Last updated: December 2025</p>
        </Col>
      </Row>
    </Container>
  );
}

export default About;
