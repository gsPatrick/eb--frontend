'use client';

import DashboardLayout from '@/components/templates/DashboardLayout';
import FigmaIcon from '@/components/atoms/FigmaIcon';
import { FIGMA_ASSETS } from '@/constants/figmaAssets';
import styles from './page.module.css';

const CHANNELS = [
  { id: 'all', label: 'All channels' },
  { id: 'facebook', label: 'Facebook', icon: FIGMA_ASSETS.icons.facebook },
  { id: 'instagram', label: 'Instagram', icon: FIGMA_ASSETS.icons.instagram, active: true },
  { id: 'linkedin', label: 'LinkedIn', icon: FIGMA_ASSETS.icons.linkedin },
  { id: 'youtube', label: 'YouTube', icon: FIGMA_ASSETS.icons.youtube },
  { id: 'twitter', label: 'Twitter', icon: FIGMA_ASSETS.icons.twitter },
];

const METRICS = [
  { label: 'Followers', value: '592k', icon: FIGMA_ASSETS.icons.users },
  { label: 'Following', value: '3.5k', icon: FIGMA_ASSETS.icons.addUser },
  { label: 'Comments', value: '2.9k', icon: FIGMA_ASSETS.icons.chat },
  { label: 'Likes', value: '9.5k', icon: FIGMA_ASSETS.icons.heart },
];

const ACTIVITY_ROWS = [
  { label: 'Profile Visits', value: '22.1k', chart: FIGMA_ASSETS.charts.activityVisit, trend: FIGMA_ASSETS.icons.trendUp, positive: true },
  { label: 'Link Clicks', value: '1.7k', chart: FIGMA_ASSETS.charts.activityClick, trend: FIGMA_ASSETS.icons.trendDown, positive: false },
  { label: 'Email Button', value: '592', chart: FIGMA_ASSETS.charts.activityEmail, trend: FIGMA_ASSETS.icons.trendUp, positive: true },
];

const POSTS = [
  { date: 'May 28', image: FIGMA_ASSETS.posts.post1, user: '@drennantravels', text: 'Back to midnight sun, when the days never ended and nature was our bedroom! 🚌', likes: '3.9k', comments: '924', saves: '102' },
  { date: 'May 24', image: FIGMA_ASSETS.posts.post2, user: '@drennantravels', text: "You'll leave the week with a warm heart, full of memories and new friends.", likes: '7.2k', comments: '1.6k', saves: '209' },
  { date: 'May 20', image: FIGMA_ASSETS.posts.post3, user: '@drennantravels', text: 'The best way to explore the world is with good company and open roads.', likes: '5.1k', comments: '812', saves: '156' },
  { date: 'May 16', image: FIGMA_ASSETS.posts.post4, user: '@drennantravels', text: 'Every sunset is a reminder that tomorrow brings new adventures.', likes: '4.3k', comments: '645', saves: '98' },
];

const GENDER = [
  { label: 'Female', value: '61%', icon: FIGMA_ASSETS.icons.female },
  { label: 'Male', value: '31%', icon: FIGMA_ASSETS.icons.male },
  { label: 'Other', value: '8%', icon: FIGMA_ASSETS.icons.otherGender },
];

export default function DesignSystemPage() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.channels}>
          {CHANNELS.map((channel) => (
            <button key={channel.id} type="button" className={`${styles.channel} ${channel.active ? styles.channelActive : ''}`}>
              {channel.icon && <FigmaIcon src={channel.icon} size={14} alt="" />}
              {channel.label}
            </button>
          ))}
        </div>

        <div className={styles.metrics}>
          {METRICS.map((metric) => (
            <div key={metric.label} className={styles.metricCard}>
              <div>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricValue}>{metric.value}</p>
              </div>
              <FigmaIcon src={metric.icon} size={24} alt="" />
            </div>
          ))}
        </div>

        <div className={styles.sectionHead}>
          <div>
            <h2>Statistics</h2>
            <p>See how your social media channels are growing and measure your success.</p>
          </div>
          <button type="button" className={styles.period}>
            This month
            <FigmaIcon src={FIGMA_ASSETS.icons.chevronDown} size={8} alt="" />
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.cardLarge}>
            <div className={styles.innerTabs}>
              <span className={styles.innerTabActive}>Reach</span>
              <span>Impressions</span>
              <span>New followers</span>
              <FigmaIcon src={FIGMA_ASSETS.icons.moreCircle} size={17} alt="" className={styles.moreIcon} />
            </div>
            <p className={styles.bigNumber}>1.05m</p>
            <p className={styles.growth}>
              +8.5%
              <FigmaIcon src={FIGMA_ASSETS.icons.chevronUp} size={10} alt="" />
            </p>
            <div className={styles.chartWrap}>
              <img src={FIGMA_ASSETS.charts.reachArea} alt="Reach chart" className={styles.chart} />
            </div>
          </div>

          <div className={styles.cardColumn}>
            <div className={styles.miniRow}>
              <div className={styles.smallCard}>
                <div className={styles.smallHead}>
                  <p>Post shares</p>
                  <FigmaIcon src={FIGMA_ASSETS.icons.moreCircle} size={17} alt="" />
                </div>
                <div className={styles.smallValueRow}>
                  <strong>31.6k</strong>
                  <span className={styles.miniGrowth}>+22% <FigmaIcon src={FIGMA_ASSETS.icons.chevronUpSmall} size={6} alt="" /></span>
                </div>
                <img src={FIGMA_ASSETS.charts.sparkline1} alt="" className={styles.spark} />
              </div>
              <div className={styles.smallCard}>
                <div className={styles.smallHead}>
                  <p>New Followers</p>
                  <FigmaIcon src={FIGMA_ASSETS.icons.moreCircle} size={17} alt="" />
                </div>
                <div className={styles.smallValueRow}>
                  <strong>2.7k</strong>
                  <span className={styles.miniGrowth}>+8.5% <FigmaIcon src={FIGMA_ASSETS.icons.chevronUpSmall} size={6} alt="" /></span>
                </div>
                <img src={FIGMA_ASSETS.charts.sparkline2} alt="" className={styles.spark} />
              </div>
            </div>

            <div className={styles.activityCard}>
              {ACTIVITY_ROWS.map((row) => (
                <div key={row.label} className={styles.activityRow}>
                  <span className={styles.activityLabel}>{row.label}</span>
                  <img src={row.chart} alt="" className={styles.activityChart} />
                  <span className={styles.activityValue}>
                    {row.value}
                    <FigmaIcon src={row.trend} size={16} alt="" className={row.positive ? styles.trendUp : styles.trendDown} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.bottomGrid}>
          <div className={styles.postsSection}>
            <h2>Posts</h2>
            <p>Overview of your published and scheduled posts</p>
            <div className={styles.postsCard}>
              <div className={styles.innerTabs}>
                <span className={styles.innerTabActive}>Latest posts</span>
                <span>Scheduled posts</span>
                <FigmaIcon src={FIGMA_ASSETS.icons.moreCircle} size={17} alt="" className={styles.moreIcon} />
              </div>
              {POSTS.map((post) => (
                <article key={post.date} className={styles.postRow}>
                  <span className={styles.postDate}>{post.date}</span>
                  <img src={post.image} alt="" className={styles.postImage} />
                  <div>
                    <p className={styles.postUser}>{post.user}</p>
                    <p className={styles.postText}>{post.text}</p>
                    <div className={styles.postStats}>
                      <span><FigmaIcon src={FIGMA_ASSETS.icons.heartOutline} size={16} alt="" /> {post.likes}</span>
                      <span><FigmaIcon src={FIGMA_ASSETS.icons.chatOutline} size={16} alt="" /> {post.comments}</span>
                      <span><FigmaIcon src={FIGMA_ASSETS.icons.bookmark} size={16} alt="" /> {post.saves}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.audienceSection}>
            <h2>Audience</h2>
            <p>See who your followers are and how they engage with your content.</p>
            <div className={styles.audienceCard}>
              <p className={styles.audienceCardTitle}>Gender breakdown</p>
              <div className={styles.genderRow}>
                <img src={FIGMA_ASSETS.charts.pieChart} alt="Gender pie chart" className={styles.pieChart} />
                <div className={styles.genderLegend}>
                  {GENDER.map((item) => (
                    <div key={item.label} className={styles.genderItem}>
                      <FigmaIcon src={item.icon} size={16} alt="" />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.audienceCard}>
              <p className={styles.audienceCardTitle}>Age groups</p>
              <img src={FIGMA_ASSETS.charts.ageChart} alt="Age groups chart" className={styles.ageChart} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
