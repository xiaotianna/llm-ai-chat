const CssGridBackground = () => {
  return (
    <>
      <div
        className='absolute inset-0 pointer-events-none z-[-1] grid-background'
        style={{
          backgroundImage: `linear-gradient(to right, rgba(36, 101, 237, 0.2) 0.5px, transparent 0.5px),
            linear-gradient(to bottom, rgba(36, 101, 237, 0.2) 0.5px, transparent 0.5px)`,
          backgroundSize: '80px 80px',
          maskImage:
            'radial-gradient(circle at center, transparent 20%, black 70%)',
          WebkitMaskImage:
            'radial-gradient(circle at center, transparent 20%, black 70%)'
        }}
      />
      <div
        className='absolute inset-0 pointer-events-none z-[-2] grid-gradient'
        style={{
          background:
            'radial-gradient(70% 70% at 50% 50%, transparent 0%, rgba(36, 101, 237, 0.05) 100%)'
        }}
      />
    </>
  )
}

export default CssGridBackground