import JobCard from './component/job-card'

async function getData(){
  const res = await fetch('http://localhost:5000/all_discord_jobs')
  return res.json()
}


export default async function Home() {
  const data = await getData()
  const jobs = data.jobs;
  return (
    <main className="min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full justify-between font-mono text-sm flex flex-col mb-8">
        <p className="text-4xl">All Discord Jobs</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {jobs.map((job:any, index:number) => (
        <JobCard key={index} job={job} />
      ))}
    </div>
    </main>
  )
}