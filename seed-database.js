// Direct database seeding script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const dummyCandidates = [
  {
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "(555) 123-4567",
    skills: "Python, Django, PostgreSQL, Docker",
    experience: 5,
    location: "San Francisco, CA",
    education: "B.S. Computer Science, Stanford University",
    resumeText: "Senior Backend Engineer with 5 years experience building scalable web applications.",
    pipelineStatus: "Interview",
    linkedin: "https://linkedin.com/in/alicejohnson",
    github: "https://github.com/alicejohnson",
    portfolio: "https://alicejohnson.dev",
    certifications: "AWS Solutions Architect, Docker Certified",
    languages: "English, Mandarin",
    salaryExpectation: 150000,
    availability: "Available",
    candidateScore: 92,
    rating: 5,
  },
  {
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phone: "(555) 234-5678",
    skills: "JavaScript, React, Node.js, AWS",
    experience: 4,
    location: "New York, NY",
    education: "B.S. Information Technology, NYU",
    resumeText: "Full Stack Developer passionate about modern web technologies and cloud infrastructure.",
    pipelineStatus: "Shortlisted",
    linkedin: "https://linkedin.com/in/bobsmith",
    github: "https://github.com/bobsmith",
    certifications: "AWS Developer Associate",
    languages: "English, Spanish",
    salaryExpectation: 135000,
    availability: "2 weeks notice",
    candidateScore: 85,
    rating: 4,
  },
  {
    name: "Carol Davis",
    email: "carol.davis@example.com",
    phone: "(555) 345-6789",
    skills: "Java, Spring Boot, Microservices, Kubernetes",
    experience: 7,
    location: "Austin, TX",
    education: "M.S. Computer Engineering, University of Texas",
    resumeText: "Senior Software Architect with deep expertise in microservices and distributed systems.",
    pipelineStatus: "Applied",
    linkedin: "https://linkedin.com/in/caroldavis",
    github: "https://github.com/caroldavis",
    portfolio: "https://caroldavis.tech",
    certifications: "Kubernetes Administrator, Java Certified Programmer",
    languages: "English, Portuguese",
    salaryExpectation: 165000,
    availability: "1 month notice",
    candidateScore: 88,
    rating: 4,
  },
  {
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "(555) 456-7890",
    skills: "TypeScript, Vue.js, Firebase, GraphQL",
    experience: 3,
    location: "Seattle, WA",
    education: "B.S. Software Engineering, University of Washington",
    resumeText: "Frontend specialist with modern JavaScript frameworks and real-time app experience.",
    pipelineStatus: "Interview",
    linkedin: "https://linkedin.com/in/davidlee",
    github: "https://github.com/davidlee",
    certifications: "Vue.js Certified Developer",
    languages: "English, Korean",
    salaryExpectation: 120000,
    availability: "Available",
    candidateScore: 80,
    rating: 4,
  },
  {
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "(555) 567-8901",
    skills: "Python, Machine Learning, TensorFlow, Data Science",
    experience: 6,
    location: "Boston, MA",
    education: "Ph.D. Machine Learning, MIT",
    resumeText: "ML Engineer with published research and production ML systems at scale.",
    pipelineStatus: "Offer",
    linkedin: "https://linkedin.com/in/emmawilson",
    github: "https://github.com/emmawilson",
    portfolio: "https://emmawilson.ai",
    certifications: "TensorFlow Certified Developer, GCP Professional",
    languages: "English, French",
    salaryExpectation: 180000,
    availability: "Available",
    candidateScore: 95,
    rating: 5,
  },
  {
    name: "Frank Brown",
    email: "frank.brown@example.com",
    phone: "(555) 678-9012",
    skills: "Go, Rust, Blockchain, System Design",
    experience: 8,
    location: "Remote",
    education: "B.S. Mathematics, Carnegie Mellon University",
    resumeText: "Systems architect and blockchain expert with experience at top-tier tech companies.",
    pipelineStatus: "Applied",
    linkedin: "https://linkedin.com/in/frankbrown",
    github: "https://github.com/frankbrown",
    portfolio: "https://frankbrown.io",
    certifications: "CKAD, Rust by Example",
    languages: "English, German",
    salaryExpectation: 195000,
    availability: "2 weeks notice",
    candidateScore: 90,
    rating: 5,
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    const deleted = await prisma.candidate.deleteMany({});
    console.log(`✓ Deleted ${deleted.count} existing candidates`);
    
    // Create candidates
    const created = await Promise.all(
      dummyCandidates.map((c) =>
        prisma.candidate.create({
          data: {
            name: c.name,
            email: c.email,
            phone: c.phone,
            skills: c.skills,
            experienceYears: c.experience,
            location: c.location,
            education: c.education,
            resumeText: c.resumeText,
            pipelineStatus: c.pipelineStatus,
            linkedin: c.linkedin,
            github: c.github,
            portfolio: c.portfolio,
            certifications: c.certifications,
            languages: c.languages,
            salaryExpectation: c.salaryExpectation,
            availability: c.availability,
            candidateScore: c.candidateScore,
            rating: c.rating,
          },
        })
      )
    );
    
    console.log(`✅ Successfully seeded ${created.length} candidates!`);
    console.log('\nCandidates created:');
    created.forEach(c => console.log(`  - ${c.name} (${c.email})`));
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    if (error.code === 'P1001') {
      console.error('\n💡 Database connection failed. Make sure your database is set up.');
    } else if (error.code === 'P2021') {
      console.error('\n💡 Table does not exist. Run: npx prisma db push');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
