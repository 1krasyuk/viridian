export function CoinDescription({
  description,
}: {
  description: Record<string, string>
}) {
  return (
    description.en && (
      <div className='bg-background p-5 rounded-md shadow-sm'>
        <h2 className='text-xl font-bold mb-3'>About</h2>
        <div className='prose max-w-full text-sm text-muted-foreground'>
          {description.en.split('\n\n\n').map((para, i) => (
            <p key={i}>
              {para.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    )
  )
}
