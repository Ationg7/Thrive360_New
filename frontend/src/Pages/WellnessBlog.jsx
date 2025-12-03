import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "../App.css";

const WellnessBlog = () => {
  const { isLoggedIn } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Topics");
  const [searchTerm, setSearchTerm] = useState("");
  const [allBlogs, setAllBlogs] = useState([]);
  const navigate = useNavigate();
  const blogCardsRef = useRef([]);

  // Hardcoded fallback blogs
 const fallbackBlogs = [
  {
    id: 1,
    title: "Finding Balance: How to Manage Academic Stress",
    category: "Mental Health",
    image:
      "https://i.pinimg.com/474x/1e/e6/6a/1ee66a4517d068f5db3b0443684b748b.jpg",
    excerpt:
      "Academic life can feel overwhelming, but with proper planning, self-care, and mindfulness, students can manage stress and maintain balance.",
    fullText: `Academic life can often feel overwhelming, with assignments, exams, and deadlines constantly piling up. It’s easy to feel stressed, anxious, or burned out, but managing academic stress is possible with the right strategies. Finding balance between studies, personal life, and self-care is key to staying productive and maintaining overall well-being.

One effective way to reduce stress is by organizing your tasks and prioritizing them. Creating a to-do list or schedule allows you to focus on the most important assignments first, preventing last-minute panic and helping you feel more in control. Breaking large projects into smaller, manageable tasks also makes studying less intimidating and more achievable.

Incorporating regular breaks into your routine is equally important. Short pauses during study sessions, physical activity, or moments of relaxation help recharge your mind and improve concentration. Techniques such as deep breathing, mindfulness, or meditation can calm the nervous system and reduce anxiety, making it easier to handle academic pressures.

Maintaining a healthy lifestyle also plays a big role in managing stress. Adequate sleep, balanced nutrition, and regular exercise improve energy levels and resilience, while staying hydrated helps your brain function at its best. Surrounding yourself with a supportive network of friends, family, or mentors provides encouragement and guidance during challenging times.

By combining planning, self-care, and mindfulness practices, students can navigate their academic responsibilities more effectively and reduce the impact of stress. Remember, managing stress isn’t about eliminating challenges—it’s about finding a sustainable balance that allows you to thrive academically while taking care of your mind and body.`,
    author: "Dr. Channy San",
  },
  {
    id: 2,
    title: "Brain Foods: Eating for Academic Success",
    category: "Nutrition",
    image:
      "https://i.pinimg.com/474x/86/6a/d0/866ad0b1e99a5a6a7809ebe4801b2147.jpg",
    excerpt:
      "Eating nutrient-rich foods boosts focus, memory, and energy, helping students stay alert and perform better academically.",
    fullText: `Eating the right foods can have a surprisingly big impact on your academic performance. Brain foods provide essential nutrients that improve focus, memory, and overall cognitive function, helping students stay sharp during classes, study sessions, and exams. Simple dietary changes, like including more fruits, vegetables, and healthy fats, can boost energy levels and support mental clarity throughout the day.

Incorporating foods rich in omega-3 fatty acids, such as salmon, walnuts, and chia seeds, helps enhance brain cell communication, improving memory and learning capacity. Leafy greens like spinach and kale provide antioxidants that protect brain cells from damage, while berries are known to support concentration and reduce mental fatigue. Whole grains, eggs, and yogurt provide steady energy and essential vitamins that keep the mind alert for longer periods.

It’s not just about what you eat, but also when you eat. Balanced meals and healthy snacks throughout the day prevent energy crashes and keep blood sugar levels stable, which contributes to sustained focus and productivity. Drinking plenty of water is also crucial, as dehydration can quickly lead to fatigue and reduced cognitive performance.

By prioritizing brain-boosting foods and maintaining a consistent, balanced diet, students can support their learning, improve memory retention, and feel more energized throughout the day. Small, mindful changes in eating habits can make a big difference in achieving academic success, proving that what you put on your plate directly influences what you can achieve in the classroom.`,
    author: "Dr. Channy San",
  },
  {
    id: 3,
    title: "The Student's Guide to Quality Sleep",
    category: "Physical Wellness",
    image:
      "https://i.pinimg.com/474x/0b/70/38/0b70385eece9929f2460e7e18f8a15e5.jpg",
    excerpt:
      "Sleep is crucial for students' performance. Consistent routines, healthy habits, and a calming environment can greatly improve sleep quality and overall well-being.",
    fullText: `Sleep is something every student needs, but it's often the first thing to get sacrificed when deadlines, exams, and assignments start piling up. Skipping sleep might seem like a quick solution to get more done, but in reality, it can make focus, memory, and overall performance worse. Getting enough quality rest isn’t just about feeling less tired—it’s about helping your brain and body function at their best.

One of the simplest ways to improve sleep is by sticking to a consistent schedule. Going to bed and waking up at roughly the same time each day helps regulate your body’s internal clock, making it easier to fall asleep naturally and wake up refreshed. Pairing this with a calming bedtime routine—like reading a book, meditating, or putting your phone away—can make a big difference in how well you sleep.

Your sleep environment also matters more than you might think. A dark, quiet, and cool room encourages deeper rest, while distractions, noise, or bright lights can make it harder to relax. Simple changes like a comfortable pillow, tidy space, and minimal electronics can help signal to your brain that it’s time to wind down.

Even what you eat and drink can affect sleep. Caffeine, energy drinks, or heavy meals late at night can keep you awake, while light snacks like bananas, almonds, or herbal tea may actually help you relax. Combine this with regular exercise and stress management, and you’re giving your body the best chance for a restful night.

Prioritizing 7 to 9 hours of sleep each night doesn’t just improve alertness and concentration—it also helps manage stress, supports your immune system, and improves overall mood. By understanding why sleep matters and building simple habits around it, students can maximize their academic performance, stay energized throughout the day, and take better care of their mind and body. Remember, it’s not just about the hours you spend asleep—it’s about the quality of those hours and the routines that support them.`,
    author: "Dr. Channy San",
  },
  {
    id: 4,
    title: "Stress-Free Studying: Mind Hacks for Exams",
    category: "Stress Management",
    image:
      "https://i.pinimg.com/474x/1e/3e/88/1e3e8884e34fa76dfcfe969d1ec0bb88.jpg",
    excerpt:
      "Studying doesn’t have to be stressful. Using effective techniques like time chunking, prioritizing topics, and mindfulness can make exam prep easier and more productive.",
    fullText: `Exams can often feel overwhelming, with deadlines piling up and expectations running high. However, studying doesn’t have to be a stressful experience. By applying a few strategic mind hacks, you can improve focus, retention, and even enjoy the process of learning. One of the most effective techniques is breaking study sessions into small, manageable chunks. Instead of long hours of cramming, try studying for 25 minutes and then taking a 5-minute break. This approach, known as the Pomodoro technique, helps maintain concentration and prevents mental fatigue.

Prioritizing key topics is another helpful strategy. Make a list of the subjects or chapters that are most important, focusing first on areas that carry the most weight in your exams. This helps reduce the anxiety that comes from feeling like you have too much to cover. Teaching what you learn to someone else, or even aloud to yourself, is a powerful way to reinforce your understanding. Explaining concepts forces your brain to organize and process information more effectively, improving long-term retention.

Visual aids such as mind maps, diagrams, and charts can also make complex topics easier to digest. Engaging different parts of your brain through visualization enhances recall and understanding. Additionally, creating a calm and organized study environment can significantly reduce distractions. Some students benefit from soft instrumental music or ambient sounds, which can help maintain focus without causing stress.

Mindfulness exercises, even just a couple of minutes of deep breathing or short meditation before studying, can greatly improve concentration and calmness. Coupled with sufficient sleep, these strategies allow your brain to absorb and retain information much better than late-night cramming. Lastly, maintaining a positive mindset is crucial. Replace negative thoughts like “I’ll never remember this” with affirmations such as “I can tackle this one step at a time.” A calm and confident mind is always more efficient than one overwhelmed by anxiety.

By breaking your study sessions into manageable pieces, using visual aids, practicing mindfulness, and taking care of your body and mind, you can approach exams with confidence and efficiency. Remember, it’s not just about the quantity of hours you spend studying, but the quality of your focus and preparation. Stress-free studying is possible, and with the right techniques, you can perform at your best without burning out.`,
    author: "Dr. Channy San",
  },


  ].map((b) => ({
    ...b,
    excerpt: b.excerpt ?? (b.fullText.substring(0, 150) + "..."),
  }));
  

 

  // Fetch blogs from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/admin/blogs");
        if (!res.ok) throw new Error("Failed to load blogs");

        const data = await res.json();
        const toImageUrl = (img) => {
          if (!img || typeof img !== "string") return null;
          return img.startsWith("http://") || img.startsWith("https://")
            ? img
            : `http://127.0.0.1:8000/storage/${img}`;
        };

        const normalized = Array.isArray(data)
          ? data.map((b) => ({
              id: b.id,
              title: b.title,
              category: b.category || "General",
              image:
                toImageUrl(b.image_url) ||
                toImageUrl(b.image_path) ||
                "https://via.placeholder.com/600x400?text=Health+%26+Wellness",
              fullText: b.content,
              // Use the actual excerpt from database if it exists, otherwise generate from content
              excerpt: b.excerpt && b.excerpt.trim() ? b.excerpt : (b.content.substring(0, 150) + "..."),
              author: b.author_name || "Admin",
            }))
          : [];

        setAllBlogs([...fallbackBlogs, ...normalized]);
      } catch (e) {
        console.error("Error fetching blogs:", e);
        setAllBlogs(fallbackBlogs);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs by category and search
  const filteredBlogs =
    activeCategory === "All Topics"
      ? allBlogs.filter((blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allBlogs.filter(
          (blog) =>
            blog.category === activeCategory &&
            blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Handle blog card click
  const handleCardClick = (blog) => {
    if (isLoggedIn) {
      navigate("/blogdetail", { state: { blog, allBlogs } });
    } else {
      setShowPopup(true);
    }
  };

  // Equal height cards
  useEffect(() => {
    if (blogCardsRef.current.length === 0) return;
    let maxHeight = 0;
    blogCardsRef.current.forEach((card) => {
      if (card) maxHeight = Math.max(maxHeight, card.offsetHeight);
    });
    blogCardsRef.current.forEach((card) => {
      if (card) card.style.height = maxHeight + "px";
    });
  }, [filteredBlogs]);

  return (
    <Container className="wellness-container">
      {/* Categories + Search */}
      <div className="category-search-container">
        <div className="categories">
          {[
            "All Topics",
            "Mental Health",
            "Physical Wellness",
            "Nutrition",
            "Stress Management",
          ].map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Blog Grid */}
      <div className="blog-grid mt-4">
        {filteredBlogs.map((blog, index) => (
          <Card
            key={blog.id}
            ref={(el) => (blogCardsRef.current[index] = el)}
            className={`blog-card${!isLoggedIn ? " blog-card-guest" : ""}`}
            onClick={() => handleCardClick(blog)}
          >
            <Card.Img variant="top" src={blog.image} />
            <div className="blog-card-body">
              <span className="blog-card-category">{blog.category}</span>
              <h5 className="blog-card-title">{blog.title}</h5>
             
            </div>
            {!isLoggedIn && (
              <div className="blog-card-overlay">Login to read more</div>
            )}
          </Card>
        ))}
      </div>

      {/* Guest Popup */}
      {showPopup && (
        <div className="meditation-notif-overlay">
          <div className="meditation-notif-popup">
            <div
              className="notif-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "18px" }}>Message</span>
              <span
                style={{ cursor: "pointer", fontWeight: "bold", fontSize: "18px" }}
                onClick={() => setShowPopup(false)}
              >
                ✕
              </span>
            </div>
            <div className="notif-line"></div>
            <p
              className="notif-message"
              style={{ textAlign: "center", marginTop: "30px" }}
            >
              Take your time. When you're ready, log in to explore this feature.
            </p>
            <div
              className="notif-btn-container"
              style={{ textAlign: "center", marginTop: "40px" }}
            >
              <Button variant="success" onClick={() => setShowPopup(false)}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}





      <style>{`
        .blog-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2e7d32;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
         background: rgba(255,255,255,0.25);
          border-radius: 8px;
          pointer-events: none;
        }

        /* Meditation-style notification */
        .meditation-notif-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }

        .meditation-notif-popup {
          background: #fff;
          border-radius: 12px;
          padding: 20px 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          max-width: 350px;
          width: 90%;
          text-align: center;
        }

        .notif-message {
          font-size: 1rem;
          color: #333;
          margin-bottom: 15px;
          line-height: 1.4;
        }
         .notif-line {
  height: 1px;
  background-color: rgba(0,0,0,0.1); /* light gray line */
  margin: 15px 0; /* space above and below */
}

        .notif-btn-container {
          display: flex;
          justify-content: center;
        }

        .notif-btn-container .btn {
          padding: 0.5rem 3rem;
          font-size: 1rem;
        }
      `}</style>
    </Container>
  );
};

export default WellnessBlog;
