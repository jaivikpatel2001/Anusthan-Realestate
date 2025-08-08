import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../hooks/useSettings';
import { useCreateLeadMutation } from '../store/api/leadsApi';
import { useToast } from '../hooks/useToast';
import SEOHead from '../components/SEOHead';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Contact.css';

const Contact = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const {
    companyName,
    contact,
    businessHours,
    integrations,
    getFormattedAddress,
    getGoogleMapsUrl,
    getWhatsAppUrl,
    getPhoneUrl,
    getEmailUrl,
    isBusinessOpen,
    isLoading: settingsLoading
  } = useSettings();

  const { showSuccess, showError } = useToast();
  const [createLead, { isLoading: submitLoading }] = useCreateLeadMutation();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      showSuccess('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        mobile: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      showError(error?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  console.log(integrations);

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (settingsLoading) {
    return <LoadingSpinner size="large" text="Loading contact information..." />;
  }

  return (
    <div className="contact-page">
      <SEOHead 
        title="Contact Us"
        description={`Get in touch with ${companyName}. Contact us for inquiries about our real estate projects.`}
        keywords={['contact', 'real estate', 'inquiry', 'phone', 'email']}
      />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Contact Us</h1>
            <p>Get in touch with our team for any inquiries about our projects</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content" ref={ref}>
        <div className="container">
          <motion.div
            className="contact-grid"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {/* Contact Information */}
            <motion.div className="contact-info" variants={itemVariants}>
              <h2>Get In Touch</h2>
              <p>We're here to help you find your perfect property. Reach out to us through any of the following channels:</p>

              <div className="contact-methods">
                {/* Phone */}
                {contact.phone.primary && (
                  <div className="contact-method">
                    <div className="method-icon">
                      <FiPhone />
                    </div>
                    <div className="method-details">
                      <h4>Phone</h4>
                      <a href={getPhoneUrl(contact.phone.primary)}>
                        {contact.phone.primary}
                      </a>
                      {contact.phone.secondary && (
                        <a href={getPhoneUrl(contact.phone.secondary)}>
                          {contact.phone.secondary}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Email */}
                {contact.email.primary && (
                  <div className="contact-method">
                    <div className="method-icon">
                      <FiMail />
                    </div>
                    <div className="method-details">
                      <h4>Email</h4>
                      <a href={getEmailUrl(contact.email.primary)}>
                        {contact.email.primary}
                      </a>
                      {contact.email.sales && (
                        <a href={getEmailUrl(contact.email.sales)}>
                          {contact.email.sales}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Address */}
                {getFormattedAddress() && (
                  <div className="contact-method">
                    <div className="method-icon">
                      <FiMapPin />
                    </div>
                    <div className="method-details">
                      <h4>Address</h4>
                      <p>{getFormattedAddress()}</p>
                      
                    </div>
                  </div>
                )}

                {/* Business Hours */}
                {businessHours && (
                  <div className="contact-method">
                    <div className="method-icon">
                      <FiClock />
                    </div>
                    <div className="method-details">
                      <h4>Business Hours</h4>
                      <div className="business-hours">
                        <div className="hours-row">
                          <span>Mon - Fri - </span>
                          <span>
                            {businessHours.weekdays?.isOpen
                              ? `${businessHours.weekdays.openTime} - ${businessHours.weekdays.closeTime}`
                              : 'Closed'}
                          </span>
                        </div>
                        <div className="hours-row">
                          <span>Saturday - </span>
                          <span>
                            {businessHours.saturday?.isOpen
                              ? `${businessHours.saturday.openTime} - ${businessHours.saturday.closeTime}`
                              : 'Closed'}
                          </span>
                        </div>
                        <div className="hours-row">
                          <span>Sunday - </span>
                          <span>
                            {businessHours.sunday?.isOpen
                              ? `${businessHours.sunday.openTime} - ${businessHours.sunday.closeTime}`
                              : 'Closed'}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {contact.phone.whatsapp && (
                  <div className="contact-method whatsapp">
                    <div className="method-icon">
                      <FaWhatsapp />
                    </div>
                    <div className="method-details">
                      <h4>WhatsApp</h4>
                      <a 
                        href={getWhatsAppUrl('Hi, I would like to inquire about your projects.')}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat with us on WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div className="contact-form-container" variants={itemVariants}>
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number *</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={errors.mobile ? 'error' : ''}
                      maxLength={10}
                    />
                    {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <LoadingSpinner size="small" color="white" showText={false} />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
          
          {/* Google Maps Embed */}
          {Boolean(integrations?.googleMaps?.apiKey) && (
            <motion.div className="contact-map" variants={itemVariants}>
              <h2>Our Location</h2>
              {String(integrations.googleMaps.apiKey).includes('<iframe') ? (
                <div
                  className="map-embed"
                  dangerouslySetInnerHTML={{ __html: integrations.googleMaps.apiKey }}
                />
              ) : (
                <iframe
                  src={integrations.googleMaps.apiKey}
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                />
              )}
            </motion.div>
          )}

        </div>
      </section>
      
    </div>
  );
};

export default Contact;
